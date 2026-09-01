import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Input } from "../../../src/ui/Input";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { Toggle } from "../../../src/ui/Toggle";
import { c } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useTenderDraft } from "../../../src/state/tenderDraft";

/** 1a (part 2) — shipment data: bill of lading, invoice, weight, value,
 * and the tax-exemption toggle with document upload. */
export default function RequestShipment() {
  const { row } = useDir();
  const draft = useTenderDraft();

  function next() {
    if (draft.service === "freight") router.push("/(client)/request/freight");
    else router.push("/(client)/request/duration");
  }

  return (
    <Screen
      titleAr="بيانات الشحنة"
      titleEn="Shipment data"
      subtitle="STEP 2 / 4 · SHIPMENT"
      footer={
        <BottomBar>
          <Btn ar="متابعة" en="Continue" onPress={next} />
        </BottomBar>
      }
    >
      <View style={{ gap: 12 }}>
        <Input labelAr="رقم البوليصة" labelEn="Bill of lading" value={draft.billOfLading} onChangeText={(v) => draft.set({ billOfLading: v })} />
        <Input labelAr="رقم الفاتورة" labelEn="Invoice no." value={draft.invoiceNo} onChangeText={(v) => draft.set({ invoiceNo: v })} />
        <Input labelAr="الوزن الإجمالي (كجم)" labelEn="Gross weight (kg)" value={draft.grossWeightKg} onChangeText={(v) => draft.set({ grossWeightKg: v })} keyboardType="numeric" />
        <Input labelAr="قيمة البضاعة (ر.ع.)" labelEn="Declared value (OMR)" value={draft.declaredValueOmr} onChangeText={(v) => draft.set({ declaredValueOmr: v })} keyboardType="numeric" />
      </View>

      <View style={{ borderWidth: 1, borderColor: c.divider, padding: 13, gap: 10 }}>
        <View style={{ flexDirection: row, alignItems: "center", justifyContent: "space-between" }}>
          <T ar="إعفاء ضريبي" en="Tax exemption" style={{ fontWeight: "500", fontSize: 13.5 }} />
          <Toggle on={draft.taxExempt} onPress={() => draft.set({ taxExempt: !draft.taxExempt })} />
        </View>
        {draft.taxExempt && (
          <View style={{ borderWidth: 1, borderColor: c.accent400, backgroundColor: c.accent100, padding: 11, alignItems: "center" }}>
            <T ar="اضغط لرفع شهادة الإعفاء" en="Tap to upload the exemption certificate" style={{ fontSize: 11.5, color: c.accent800 }} />
          </View>
        )}
      </View>
    </Screen>
  );
}
