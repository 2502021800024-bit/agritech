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

    // Call verify_otp RPC
    const { data: verifyResult, error: verifyError } = await adminClient.rpc("verify_otp", {
      phone,
      code,
      role: role || "farmer",
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

    if (verifyResult.new_user) {
      // Create new auth user
      const tempPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: signUpData, error: signUpError } = await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { phone, role: userRole },
      });

      if (signUpError) {
        return new Response(
          JSON.stringify({ error: signUpError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Create user profile
      await adminClient.from("user_profiles").upsert({
        id: signUpData.user.id,
        phone,
        role: userRole,
      });
    }

    // Sign in as the user to get a session
    // Since we don't know the password, we use admin.generateLink with type 'recovery'
    // then extract the token. But simpler: we'll sign in with a known password approach.
    // Instead, let's generate a magic link token and exchange it.
    // Actually the simplest approach: use admin.signInWithPassword won't work since we
    // don't store the password. Let's use the anon client to sign in with email+password
    // using the tempPassword we just set (for new users) or reset password for existing users.

    // For existing users, we need to reset their password to a known value then sign in
    const newPassword = crypto.randomUUID() + crypto.randomUUID();

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      verifyResult.user_id || verifyResult.email,
      { password: newPassword },
    );

    // If updateError is because user doesn't exist via that ID, try by email
    let actualUserId = verifyResult.user_id;

    if (updateError) {
      // Try to find user by email
      const { data: usersList } = await adminClient.auth.admin.listUsers();
      const foundUser = usersList?.users?.find((u: { email: string }) => u.email === email);
      if (foundUser) {
        actualUserId = foundUser.id;
        await adminClient.auth.admin.updateUserById(foundUser.id, { password: newPassword });
      }
    }

    if (!actualUserId && verifyResult.new_user) {
      // Get the user we just created
      const { data: usersList2 } = await adminClient.auth.admin.listUsers();
      const foundUser = usersList2?.users?.find((u: { email: string }) => u.email === email);
      if (foundUser) {
        actualUserId = foundUser.id;
        // For new user, use the tempPassword we set during creation
        const anonClient = createClient(supabaseUrl, anonKey);
        const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
          email,
          password: tempPassword,
        });
        if (signInError) {
          // Fallback: try with newPassword
          const { data: signInData2, error: signInError2 } = await anonClient.auth.signInWithPassword({
            email,
            password: newPassword,
          });
          if (signInError2) {
            return new Response(
              JSON.stringify({ error: "Failed to create session" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
          return new Response(
            JSON.stringify({
              success: true,
              session: signInData2.session,
              user: { phone, role: userRole, email },
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
      }
    }

    // Sign in with the new password
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password: newPassword,
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
