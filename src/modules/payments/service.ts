import "server-only";

import { randomUUID } from "node:crypto";
import {
  CohortStatus,
  EnrollmentStatus,
  PaymentStatus,
  Prisma,
  ProgramAccessType,
  ProgramStatus,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { nextPaymentStatus } from "@/modules/payments/lifecycle";
import { getPaymentProvider } from "@/modules/payments/providers";
import type {
  PaymentProvider,
  VerifiedPayment,
} from "@/modules/payments/providers/types";
import { PaymentProviderError } from "@/modules/payments/providers/types";

export class PaymentError extends Error {}

const checkoutLifetimeMs = 60 * 60 * 1000;

function paymentReference() {
  return `yaye_${randomUUID().replaceAll("-", "")}`;
}

function paymentInclude() {
  return {
    program: { select: { id: true, title: true, slug: true } },
    cohort: { select: { id: true, name: true } },
    user: { select: { id: true, name: true, email: true } },
  } as const;
}

export async function getCheckoutProgram(programId: string, userId: string) {
  const program = await prisma.program.findFirst({
    where: {
      id: programId,
      status: ProgramStatus.PUBLISHED,
      accessType: ProgramAccessType.PAID,
    },
    include: {
      cohorts: {
        where: { status: { in: [CohortStatus.UPCOMING, CohortStatus.ACTIVE] } },
        orderBy: { startDate: "asc" },
        include: {
          _count: {
            select: {
              enrollments: {
                where: { status: { not: EnrollmentStatus.CANCELLED } },
              },
            },
          },
        },
      },
    },
  });
  if (!program || !program.price || program.price.lte(0)) return null;
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      cohort: { programId },
      status: { not: EnrollmentStatus.CANCELLED },
    },
    select: { id: true },
  });
  return { program, enrollment };
}

export async function createPaidCheckout(
  user: Readonly<{ id: string; name: string; email: string }>,
  programId: string,
  provider: PaymentProvider = getPaymentProvider(),
) {
  const checkout = await getCheckoutProgram(programId, user.id);
  if (!checkout) throw new PaymentError("This paid program is not available.");
  if (checkout.enrollment)
    throw new PaymentError("You are already enrolled in this program.");
  const amount = checkout.program.price;
  if (!amount || amount.lte(0)) {
    throw new PaymentError("This paid program does not have a valid price.");
  }
  const cohort = checkout.program.cohorts.find(
    (item) => !item.capacity || item._count.enrollments < item.capacity,
  );
  if (!cohort)
    throw new PaymentError("No paid-program seats are currently available.");

  const reusable = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      cohortId: cohort.id,
      status: PaymentStatus.PENDING,
      checkoutExpiresAt: { gt: new Date() },
      checkoutUrl: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });
  if (reusable?.checkoutUrl) return reusable;

  const merchantReference = paymentReference();
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      programId: checkout.program.id,
      cohortId: cohort.id,
      merchantReference,
      amount,
      currency: checkout.program.currency.toUpperCase(),
      providerMode: env.CHAPA_MODE,
      checkoutExpiresAt: new Date(Date.now() + checkoutLifetimeMs),
    },
  });

  try {
    const result = await provider.createCheckout({
      amount: payment.amount.toFixed(2),
      currency: payment.currency,
      email: user.email,
      name: user.name,
      merchantReference,
      callbackUrl: `${env.NEXT_PUBLIC_APP_URL}/api/payments/chapa/callback`,
      returnUrl: `${env.NEXT_PUBLIC_APP_URL}/payment/success?payment=${payment.id}`,
      title: "Yaye Academy",
      description: checkout.program.title,
    });
    return prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutUrl: result.checkoutUrl },
    });
  } catch (error) {
    if (error instanceof PaymentProviderError && error.definitive) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, failureReason: error.message },
      });
    }
    throw error;
  }
}

function assertVerifiedPayment(
  payment: Readonly<{
    merchantReference: string;
    amount: Prisma.Decimal;
    currency: string;
    providerMode: string;
  }>,
  verified: VerifiedPayment,
) {
  if (verified.merchantReference !== payment.merchantReference) {
    throw new PaymentError(
      "Chapa returned a mismatched transaction reference.",
    );
  }
  if (!new Prisma.Decimal(verified.amount).equals(payment.amount)) {
    throw new PaymentError("Chapa returned a mismatched payment amount.");
  }
  if (verified.currency.toUpperCase() !== payment.currency.toUpperCase()) {
    throw new PaymentError("Chapa returned a mismatched payment currency.");
  }
  if (verified.mode !== payment.providerMode) {
    throw new PaymentError("Chapa returned a mismatched payment mode.");
  }
}

export async function reconcilePayment(
  merchantReference: string,
  provider: PaymentProvider = getPaymentProvider(),
  event?: Readonly<{
    eventKey: string;
    eventType: string;
    payload: Record<string, unknown>;
  }>,
) {
  const payment = await prisma.payment.findUnique({
    where: { merchantReference },
  });
  if (!payment) throw new PaymentError("Payment not found.");

  if (event) {
    const existingEvent = await prisma.paymentEvent.findUnique({
      where: { eventKey: event.eventKey },
    });
    if (existingEvent?.processedAt) return payment;
  }

  const verified = await provider.verifyPayment(merchantReference);
  assertVerifiedPayment(payment, verified);

  return prisma.$transaction(
    async (transaction) => {
      const current = await transaction.payment.findUniqueOrThrow({
        where: { id: payment.id },
      });
      let eventId: string | undefined;
      if (event) {
        const eventRecord = await transaction.paymentEvent.upsert({
          where: { eventKey: event.eventKey },
          update: {},
          create: {
            paymentId: current.id,
            eventKey: event.eventKey,
            eventType: event.eventType,
            payload: event.payload as Prisma.InputJsonValue,
          },
        });
        if (eventRecord.processedAt) return current;
        eventId = eventRecord.id;
      }

      const nextStatus = nextPaymentStatus(current.status, verified.status);
      const now = new Date();
      const updated = await transaction.payment.update({
        where: { id: current.id },
        data: {
          status: nextStatus,
          providerReference: verified.providerReference,
          failureReason:
            nextStatus === PaymentStatus.FAILED
              ? (verified.failureReason ?? "Payment failed at Chapa.")
              : null,
          paidAt:
            nextStatus === PaymentStatus.SUCCESS
              ? (current.paidAt ?? now)
              : current.paidAt,
          refundedAt:
            nextStatus === PaymentStatus.REFUNDED
              ? (current.refundedAt ?? now)
              : current.refundedAt,
          metadata: {
            paymentMethod: verified.paymentMethod ?? null,
            verifiedMode: verified.mode,
          },
        },
      });

      if (nextStatus === PaymentStatus.SUCCESS) {
        await transaction.enrollment.upsert({
          where: {
            userId_cohortId: {
              userId: current.userId,
              cohortId: current.cohortId,
            },
          },
          update: { status: EnrollmentStatus.ACTIVE, completedAt: null },
          create: { userId: current.userId, cohortId: current.cohortId },
        });
      }
      if (eventId) {
        await transaction.paymentEvent.update({
          where: { id: eventId },
          data: { processedAt: now },
        });
      }
      return updated;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function processPaymentWebhook(
  rawBody: string,
  headers: Headers,
  provider: PaymentProvider = getPaymentProvider(),
) {
  const event = provider.verifyWebhook(rawBody, headers);
  return reconcilePayment(event.merchantReference, provider, event);
}

export function getLearnerPayment(userId: string, paymentId: string) {
  return prisma.payment.findFirst({
    where: { id: paymentId, userId },
    include: paymentInclude(),
  });
}

export function listLearnerPayments(userId: string) {
  return prisma.payment.findMany({
    where: { userId },
    include: paymentInclude(),
    orderBy: { createdAt: "desc" },
  });
}

export function listAdminPayments() {
  return prisma.payment.findMany({
    include: paymentInclude(),
    orderBy: { createdAt: "desc" },
  });
}

export function getAdminPayment(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      ...paymentInclude(),
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}
