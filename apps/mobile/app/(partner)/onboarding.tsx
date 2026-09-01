import { useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Lbl, Mono } from "../../src/ui/Text";
import { Btn } from "../../src/ui/Btn";
import { BottomBar } from "../../src/ui/BottomBar";
import { c, font } from "../../src/ui/tokens";
import { useDir } from "../../src/state/locale";
import { useSession } from "../../src/state/session";
import { apiFetch } from "../../src/lib/api";
import { providerTypes, ports } from "@tanafus/i18n";
import type { KycApplication, ProviderType } from "@tanafus/types";

/** 2a — provider onboarding & KYC: pick a provider type (brokers must also
 * choose their licensed ports — geo-fences the tender feed later), then
 * upload the required documents one by one. */
export default function Onboarding() {
  const { row } = useDir();
  const token = useSession((s) => s.token);
  const [providerType, setProviderType] = useState<ProviderType>("broker");
  const [selectedPorts, setSelectedPorts] = useState<Record<string, boolean>>({ "SOH-01": true });
  const [application, setApplication] = useState<KycApplication | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<KycApplication | null>("/kyc/me", token).then(setApplication).catch(() => {});
  }, [token]);

  async function startApplication() {
    setSubmitting(true);
    try {
      const app = await apiFetch<KycApplication>("/kyc", token, {
        method: "POST",
        body: JSON.stringify({ providerType, requestedPortCodes: providerType === "broker" ? Object.keys(selectedPorts).filter((k) => selectedPorts[k]) : [] }),
      });
      setApplication(app);
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadDoc(docKey: string) {
    if (!application) return;
    setUploading(docKey);
    try {
      const updated = await apiFetch<KycApplication>(`/kyc/${application.id}/documents`, token, {
        method: "POST",
        body: JSON.stringify({ docKey }),
      });
      setApplication(updated);
      if (updated.documents.every((d) => d.uploaded)) router.replace("/(partner)/under-review");
    } finally {
      setUploading(null);
    }
  }

  const doneDocs = application?.documents.filter((d) => d.uploaded).length ?? 0;
  const totalDocs = application?.documents.length ?? 0;

  if (!application) {
    return (
      <Screen
        titleAr="بوابة التسجيل"
        titleEn="Provider onboarding"
        subtitle="STEP 1 / 2 · PROVIDER TYPE"
        footer={
          <BottomBar>
            <Btn ar="متابعة" en="Continue" onPress={startApplication} loading={submitting} />
          </BottomBar>
        }
      >
        <View style={{ gap: 10 }}>
          {providerTypes.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => setProviderType(p.key)}
              style={{ flexDirection: row, alignItems: "center", gap: 12, borderWidth: 1, borderColor: providerType === p.key ? c.accent : c.divider, backgroundColor: providerType === p.key ? c.accent100 : "transparent", padding: 14 }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: providerType === p.key ? c.accent : c.neutral400,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {providerType === p.key && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.accent }} />}
              </View>
              <View style={{ flex: 1 }}>
                <T ar={p.ar} en={p.en} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 14.5 }} />
                <T ar={p.noteAr} en={p.noteEn} style={{ fontSize: 11.5, color: c.textMuted55, marginTop: 2 }} />
              </View>
            </Pressable>
          ))}
        </View>

        {providerType === "broker" && (
          <View style={{ gap: 8 }}>
            <Lbl>
              <T ar="المنافذ المصرَّح لك بها" en="Your licensed ports" />
            </Lbl>
            {ports.map((p) => {
              const on = selectedPorts[p.code];
              return (
                <Pressable
                  key={p.code}
                  onPress={() => setSelectedPorts((s) => ({ ...s, [p.code]: !s[p.code] }))}
                  style={{ flexDirection: row, alignItems: "center", gap: 10, borderWidth: 1, borderColor: on ? c.accent : c.divider, backgroundColor: on ? c.accent100 : "transparent", padding: 12 }}
                >
                  <Mono style={{ fontSize: 9.5, color: on ? c.accent700 : c.textMuted45 }}>{p.code}</Mono>
                  <T ar={p.ar} en={p.en} style={{ flex: 1, fontSize: 13, color: on ? c.accent900 : c.textMuted60 }} />
                </Pressable>
              );
            })}
          </View>
        )}
      </Screen>
    );
  }

  return (
    <Screen titleAr="رفع المستندات" titleEn="Upload documents" subtitle={`STEP 2 / 2 · ${doneDocs} / ${totalDocs}`}>
      <View style={{ gap: 10 }}>
        {application.documents.map((d) => (
          <Pressable
            key={d.key}
            disabled={d.uploaded}
            onPress={() => uploadDoc(d.key)}
            style={{ flexDirection: row, alignItems: "center", gap: 12, borderWidth: 1, borderColor: d.uploaded ? c.accent400 : c.divider, backgroundColor: d.uploaded ? c.accent100 : "transparent", padding: 14 }}
          >
            <Mono style={{ fontSize: 16, color: d.uploaded ? c.accent700 : c.textMuted45 }}>{uploading === d.key ? "…" : d.uploaded ? "✓" : "＋"}</Mono>
            <View style={{ flex: 1 }}>
              <T ar={d.labelAr} en={d.labelEn} style={{ fontWeight: "500", fontSize: 13.5 }} />
              <T
                ar={d.uploaded ? "تم الرفع" : "اضغط للرفع"}
                en={d.uploaded ? "UPLOADED" : "TAP TO UPLOAD"}
                style={{ fontSize: 10.5, color: d.uploaded ? c.accent700 : c.textMuted45, marginTop: 2 }}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
