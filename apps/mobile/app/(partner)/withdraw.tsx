import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Chip } from "../../src/ui/Chip";
import { Btn } from "../../src/ui/Btn";
import { BottomBar } from "../../src/ui/BottomBar";
import { Mono } from "../../src/ui/Text";
import { c } from "../../src/ui/tokens";
import { useDir } from "../../src/state/locale";
import { useSession } from "../../src/state/session";
import { useApi } from "../../src/lib/useApi";
import { apiFetch } from "../../src/lib/api";

interface WalletResponse {
  availableOmr: number;
}

const PRESETS = [250, 500, 1000];

/** 4c — withdrawal request + bank details. */
export default function Withdraw() {
  const { row } = useDir();
  const token = useSession((s) => s.token);
  const { data: wallet, loading } = useApi<WalletResponse>("/wallet");
  const [amount, setAmount] = useState(250);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const bank = { bankName: "BANK MUSCAT", accountHolder: "AL WAJAJAH BUREAU", iban: "OM.. 0018 4417" };

  async function submit() {
    setSubmitting(true);
    try {
      await apiFetch("/wallet/withdraw", token, { method: "POST", body: JSON.stringify({ amountOmr: amount, ...bank }) });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Screen titleAr="طلب تحويل" titleEn="Withdraw earnings">
        <View style={{ alignItems: "center", gap: 12, paddingTop: 30 }}>
          <T ar="تم إرسال طلب التحويل" en="Withdrawal request sent" style={{ fontSize: 18, fontWeight: "600" }} />
          <Btn ar="العودة للمحفظة" en="Back to wallet" onPress={() => router.replace("/(partner)/wallet")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      titleAr="طلب تحويل"
      titleEn="Withdraw earnings"
      subtitle={loading ? "" : `AVAILABLE ${(wallet?.availableOmr ?? 0).toFixed(3)} OMR`}
      footer={
        <BottomBar>
          <Btn ar="إرسال الطلب" en="Send request" onPress={submit} loading={submitting} disabled={amount <= 0} />
        </BottomBar>
      }
    >
      <View style={{ borderWidth: 1, borderColor: c.divider, padding: 16, gap: 12 }}>
        <T ar="المبلغ المطلوب تحويله" en="Amount to transfer" style={{ fontSize: 11, color: c.textMuted58 }} />
        <View style={{ flexDirection: row, alignItems: "baseline", gap: 7 }}>
          <Mono style={{ fontSize: 34, fontWeight: "600" }}>{amount.toFixed(3)}</Mono>
          <Mono style={{ fontSize: 13, color: c.textMuted55 }}>OMR</Mono>
        </View>
        <View style={{ flexDirection: row, gap: 6 }}>
          {PRESETS.map((p) => (
            <Chip key={p} mono={String(p)} on={amount === p} onPress={() => setAmount(p)} />
          ))}
          <Chip mono="MAX" on={amount === Math.floor(wallet?.availableOmr ?? 0)} onPress={() => setAmount(Math.floor(wallet?.availableOmr ?? 0))} />
        </View>
      </View>

      <View style={{ borderWidth: 1, borderColor: c.divider }}>
        <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: c.divider }}>
          <T ar="الحساب المصرفي" en="Bank account" style={{ fontSize: 11, fontWeight: "600", letterSpacing: 1 }} />
        </View>
        {[
          { ar: "اسم البنك", en: "Bank", v: bank.bankName },
          { ar: "اسم صاحب الحساب", en: "Account holder", v: bank.accountHolder },
          { ar: "رقم الآيبان", en: "IBAN", v: bank.iban },
        ].map((f, i, arr) => (
          <View key={f.ar} style={{ flexDirection: row, alignItems: "center", gap: 10, paddingVertical: 11, paddingHorizontal: 13, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: c.divider }}>
            <T ar={f.ar} en={f.en} style={{ flex: 1, fontSize: 12.5, color: c.textMuted60 }} />
            <Mono style={{ fontSize: 12.5, fontWeight: "500" }}>{f.v}</Mono>
          </View>
        ))}
      </View>
    </Screen>
  );
}
