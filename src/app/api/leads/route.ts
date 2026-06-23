import { NextResponse } from "next/server";
import {
  asTrimmedString,
  checkRateLimit,
  getClientIp,
  hashRateLimitKey,
  rateLimitHeaders,
  readJsonBody,
} from "@/lib/security";

const LEAD_BODY_LIMIT_BYTES = 8 * 1024;
const LEAD_IP_HOURLY_LIMIT = 5;
const LEAD_PHONE_DAILY_LIMIT = 3;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await readJsonBody<{
      name?: unknown;
      phone?: unknown;
      question?: unknown;
      company?: unknown;
    }>(request, LEAD_BODY_LIMIT_BYTES);

    if (!body) {
      return NextResponse.json(
        { error: "Некорректный или слишком большой запрос." },
        { status: 400 }
      );
    }

    if (typeof body.company === "string" && body.company.trim()) {
      return NextResponse.json({ success: true });
    }

    const name = asTrimmedString(body.name, 80);
    const phone = asTrimmedString(body.phone, 40);
    const question = asTrimmedString(body.question, 1000);

    // Validate required fields
    if (!name || !phone || !question) {
      return NextResponse.json(
        { error: "Имя, телефон и вопрос обязательны." },
        { status: 400 }
      );
    }

    // Phone validation: must be 11 digits, start with 7
    const phoneClean = phone.replace(/\D/g, "");
    if (phoneClean.length !== 11 || !phoneClean.startsWith("7")) {
      return NextResponse.json(
        { error: "Телефон должен состоять из 11 цифр и начинаться с 7 (например, 79991234567)." },
        { status: 400 }
      );
    }

    const ipLimit = checkRateLimit(
      hashRateLimitKey(["lead", "ip", getClientIp(request)]),
      LEAD_IP_HOURLY_LIMIT,
      HOUR_MS,
    );
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Слишком много заявок. Пожалуйста, попробуйте позже." },
        { status: 429, headers: rateLimitHeaders(ipLimit) }
      );
    }

    const phoneLimit = checkRateLimit(
      hashRateLimitKey(["lead", "phone", phoneClean]),
      LEAD_PHONE_DAILY_LIMIT,
      DAY_MS,
    );
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { error: "По этому номеру уже отправлено несколько заявок. Пожалуйста, попробуйте позже." },
        { status: 429, headers: rateLimitHeaders(phoneLimit) }
      );
    }

    const referralId = process.env.PRAVOVED_REFERRAL_ID;
    const secret = process.env.PRAVOVED_SECRET;

    if (!referralId || !secret) {
      console.error("Missing Pravoved secrets in environment.");
      return NextResponse.json(
        { error: "Внутренняя ошибка сервера. Обратитесь к администратору." },
        { status: 500 }
      );
    }

    // Prepare x-www-form-urlencoded data
    const formData = new URLSearchParams();
    formData.append("edata[name]", name);
    formData.append("edata[phone]", phoneClean);
    formData.append("edata[question]", question);
    formData.append("edata[cd-referral]", referralId);
    formData.append("edata[secret]", secret);

    const apiResponse = await fetch("https://leads-reception.feedot.com/api/v1/partner-leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await apiResponse.json();

    if (apiResponse.ok && result.code === 200 && result.edata?.result === "success") {
      return NextResponse.json({ success: true, leadId: result.edata.entityId });
    } else {
      console.error("Pravoved API Error", { status: apiResponse.status, code: result?.code });
      return NextResponse.json(
        { error: "Ошибка при отправке заявки. Пожалуйста, попробуйте позже." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Lead processing error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера." },
      { status: 500 }
    );
  }
}
