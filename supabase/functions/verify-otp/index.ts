import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { phone, code, role } = await req.json();
    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Phone and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Step 1: Verify OTP via RPC
    const { data: verifyResult, error: verifyError } = await adminClient.rpc("verify_otp", {
      p_phone: phone,
      p_code: code,
      p_role: role || "farmer",
    });

    if (verifyError) {
      return new Response(
        JSON.stringify({ error: verifyError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!verifyResult.success) {
      return new Response(
        JSON.stringify({ error: verifyResult.error || "Verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const email = verifyResult.email;
    const userRole = verifyResult.role || role || "farmer";

    // Step 2: If new user, create auth user. If existing, update password.
    // We use a deterministic password approach so we don't need to list users.
    const password = phone + "_" + code + "_agristore_secret";

    if (verifyResult.new_user) {
      const { error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone, role: userRole },
      });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Create user profile
      // Need to get the user ID
      const { data: usersList } = await adminClient.auth.admin.listUsers();
      const newUser = usersList?.users?.find((u: { email: string }) => u.email === email);
      if (newUser) {
        await adminClient.from("user_profiles").upsert({
          id: newUser.id,
          phone,
          role: userRole,
        });
      }
    } else {
      // Existing user - update their password to the deterministic one
      const userId = verifyResult.user_id;
      if (userId) {
        await adminClient.auth.admin.updateUserById(userId, { password });
      }
    }

    // Step 3: Sign in with the anon client to get a session
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({ error: "Failed to create session: " + signInError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: signInData.session,
        user: { phone, role: userRole, email },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
