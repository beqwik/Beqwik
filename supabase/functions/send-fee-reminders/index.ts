import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeeReminderItem {
  id: string;
  student_name: string;
  email: string;
  phone: string;
  total_fee: number;
  paid_fee: number;
  due_fee: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { organizationId, dueStudents } = await req.json();

    if (!organizationId || !dueStudents || !Array.isArray(dueStudents)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    const successfulLogs: any[] = [];

    for (const student of dueStudents as FeeReminderItem[]) {
      // 1. Send Email via Resend
      if (student.email && resendApiKey) {
        try {
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Beqwik Notifications <onboarding@resend.dev>",
              to: student.email,
              subject: "Important: Fee Reminder",
              html: `<p>Dear ${student.student_name},</p><p>This is a gentle reminder that your fee of <strong>₹${student.due_fee}</strong> is currently due.</p><p>Please clear your dues as soon as possible.</p><p>Thank you!</p>`,
            }),
          });
          if (emailRes.ok) {
            successfulLogs.push({ fee_payment_id: student.id, sent_channel: "email", sent_to: student.email, status: "sent" });
          }
        } catch (err) {
          console.error("Email error:", err);
        }
      }

      // 2. Send SMS via Twilio
      if (student.phone && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          const body = new URLSearchParams({
            To: student.phone,
            From: twilioPhoneNumber,
            Body: `Dear ${student.student_name}, your fee of Rs.${student.due_fee} is due. Please clear your dues.`,
          });
          const smsRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              },
              body: body.toString(),
            }
          );
          if (smsRes.ok) {
            successfulLogs.push({ fee_payment_id: student.id, sent_channel: "sms", sent_to: student.phone, status: "sent" });
          }
        } catch (err) {
          console.error("SMS error:", err);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        successfulLogs,
        message: `Dispatched successful channels. (In-app alerts handled by client)`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
