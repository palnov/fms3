import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, question } = body;

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
      console.error("Pravoved API Error:", result);
      return NextResponse.json(
        { error: "Ошибка при отправке заявки. Пожалуйста, попробуйте позже." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Lead processing error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера." },
      { status: 500 }
    );
  }
}
