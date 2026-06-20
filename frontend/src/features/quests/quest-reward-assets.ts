const rewardAssets = import.meta.glob("../../../assets/*.svg", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const zoneAssets = import.meta.glob("../../assets/zones/*.svg", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

export function getRewardAsset(
  fileName: string,
  fallbackFileName?: string
): string | null {
  return (
    rewardAssets[`../../../assets/${fileName}`] ??
    (fallbackFileName
      ? zoneAssets[`../../assets/zones/${fallbackFileName}`]
      : null)
  );
}
