import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// DADOS DO SEU JSON:
const PROJECT_ID = "barbz-2d089";
const SERVICE_ACCOUNT_EMAIL = "firebase-adminsdk-fbsvc@barbz-2d089.iam.gserviceaccount.com";
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHKqJWyly0HJJT
/V3mkBogOEGhsvTrcWT+aFuGdKx3QwthmGC++k9LU0kVpEdTJ/NlJ5CdSQDO2Pao
+m2EfokyXp3cmPT+XaHLhUB5WFReLH3PuxRpIvrTfbDz7P0HHHxCtFBnzayoQ8j7
xuZyLwTFRByvongNErVqfj2JwlhqpEnbl666d0pEiS3igQbe8MjfTD+EBE7Ahlox
RH1h0hciobH5J4x0quYABAnGwN9dzXTRTaRcFNwjZkw6U07sogbHX4aHxmCmdfzY
bB6EzCGqxtUh5D+TDF8eBaGmSj0qnpHoARpT84C0Uv+PVKpSFMM21FchcDA0ErDI
Y3b85S11AgMBAAECggEAIZS0roGMQ+oVWgf8TyW44fnaRxNPbGtAJg0ecXs2oR0y
zA/PMCQwPnkad4WtaP3xcfrLzVlDw5ydajxfPtm+9Dkz0MARftn2r8QV7N/Rydci
l2XpuRhmxkYJEffBafOJmA2jCP2KwQw81QbiUBpRaZlkZNC2AS5IXF5QreuQ0Nn5
1evrx0kO/W1uz7Pc/JAsG0quCqGK2HqRAyMpDhrXnbu8prPs7NnXHdPoqairedD/
icC10QoS2MaTuXXHONyUawWv7GMFnb2qno168Jkl+Gqg8KKJr+p2eGBsR996TNx2
oFMO4ecFSVPYlX7vgo0fWgCWcL2ulzugITIS3gIAAQKBgQD9/Uj2RNeECOzXJ9yW
dDtnGl0fGvYVDL+TqbaX3APFTWTiDn3WOobpAEwxyhW0xFqhnXFC+twhxyY/jL4K
RkxKZ/zErJjonSjNfSGeOrDzJZmZ6crd7ImQUP4en5bNhfCPpXMFqAg1x10zCjJJ
vcNGSVC05vPQsREA2BxDdvRgAQKBgQDIvj/aoGsJ9o/egpuemlBbP5xLnEPkrWVY
WiRjPwI4nQxiI6Q043oIZ6t1/7Ii/T4oQYYdaZB9IeGzQD6PU6G93VJJVmgJO2f1
S0HBbzflafbZYIPl1U5BUjioaVp4HV1CUqP4G2cqHMw9FSdzZzhIuowaTC7S9Pw8
CT92PlVNdQKBgC6vNY/+i1Z7hXzumL8W0ixbTi5/eCfaVgRAN42mJRNI7HgYjcyo
qU9+fILSUDcPuFDobX8QORIEVuVrayrcTP2IK4/C4cAv0uYiT+GTjB7FFHyT2nP8
HDTojiz2zHMuYU8l7ARoJEouQNU21JN1S8VJiIoXwUzknul2z4se/EABAoGAC8u6
HtOsVoKJg66zDEfPDv2W5o6BIs/Zk66AUuCh9cessZuci4sOYa4N0jo7MnklDOKE
yfepCOFTzN+qjWuBppF5w1tzc49tFWndrEsnwrBOVAmq1neJSKdXMvY13bcEAuCu
R+b8UeotSi2TCuH22bc0glsVqUnCBJkahI03H/0CgYEAptghw5AND9woR7YnvzY6
sZW5OKGsWoGuCOvrnhL34o8+QitB9LRAIOrJCOy9aOxUBRsfpCcSEfMjQnrJpj0O
o6X+/TojlFvEdnibG9SvhMbxr3g4W1Y3BKxaPbZnwrdylKvbgejN2bAs+AltKD4u
gWGliqxs24kHWHOK+Kn0Wt8=
-----END PRIVATE KEY-----`;

async function getAccessToken() {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60;
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp,
  };

  function toBase64(obj: any) {
    return base64Encode(new TextEncoder().encode(JSON.stringify(obj)));
  }

  const unsignedToken = `${toBase64(header)}.${toBase64(payload)}`;
  // ATENÇÃO: Deno pode precisar de uma lib externa para assinar o JWT com RS256.
  // Veja https://deno.land/x/djwt ou https://deno.land/x/jose para assinar o JWT.
  // Aqui está um exemplo usando djwt:
  // import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt@v2.8/mod.ts";
  // ... (implemente a assinatura do JWT aqui) ...

  // Após gerar o JWT, troque por access_token:
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${unsignedToken}`,
  });
  const data = await res.json();
  return data.access_token;
}

serve(async (req) => {
  // --- CORS preflight handler ---
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "https://barbz.vercel.app",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // --- Normal POST handler ---
  const { userId, title, body } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", userId);

  if (!tokens || tokens.length === 0) {
    return new Response("Nenhum token encontrado", {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": "https://barbz.vercel.app",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const accessToken = await getAccessToken();

  for (const { token } of tokens) {
    await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
        },
      }),
    });
  }

  return new Response("Notificações enviadas!", {
    headers: {
      "Access-Control-Allow-Origin": "https://barbz.vercel.app",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
});