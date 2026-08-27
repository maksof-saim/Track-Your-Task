import { Resend } from "resend";

export async function POST() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return Response.json(
            { success: false, error: "RESEND_API_KEY environment variable is missing" },
            { status: 500 }
        );
    }

    const resend = new Resend(apiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: ["saimsyed162@gmail.com"],
            subject: "Test Email",
            html: `
        <h1>Email Working!</h1>
        <p>Your Next.js application can now send emails.</p>
      `,
        });

        if (error) {
            return Response.json(
                { success: false, error },
                { status: 500 }
            );
        }

        return Response.json({
            success: true,
            data,
        });
    } catch (error) {
        return Response.json(
            {
                success: false,
                error: "Something went wrong",
            },
            { status: 500 }
        );
    }
}