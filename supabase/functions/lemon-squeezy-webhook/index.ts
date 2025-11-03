import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('X-Signature');
    const signingSecret = Deno.env.get('LEMON_SQUEEZY_SIGNING_SECRET');

    if (!signingSecret) {
      console.error('Missing LEMON_SQUEEZY_SIGNING_SECRET');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify signature
    if (signature) {
      const hmac = createHmac('sha256', signingSecret);
      hmac.update(rawBody);
      const digest = hmac.digest('hex');

      if (digest !== signature) {
        console.error('Invalid signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.meta?.event_name;
    const customerEmail = payload.data?.attributes?.user_email || 
                         payload.data?.attributes?.customer_email;

    console.log(`Received webhook event: ${eventType} for email: ${customerEmail}`);

    if (!customerEmail) {
      console.error('No email found in webhook payload');
      return new Response(
        JSON.stringify({ error: 'No email in payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine if this is a Pro upgrade or downgrade event
    let shouldBeProUser = false;

    const upgradeEvents = [
      'order_created',
      'subscription_created',
      'subscription_payment_success',
      'subscription_plan_changed'
    ];

    const downgradeEvents = [
      'subscription_cancelled',
      'subscription_payment_failed'
    ];

    if (upgradeEvents.includes(eventType)) {
      shouldBeProUser = true;
    } else if (downgradeEvents.includes(eventType)) {
      shouldBeProUser = false;
    } else {
      console.log(`Ignoring event type: ${eventType}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Event type not handled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user by email and update plan
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, plan')
      .eq('email', customerEmail);

    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profiles || profiles.length === 0) {
      console.error(`No user found with email: ${customerEmail}`);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profile = profiles[0];
    const newPlan = shouldBeProUser ? 'pro' : 'free';

    // Update user plan
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating user plan:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully updated user ${customerEmail} to plan: ${newPlan}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
