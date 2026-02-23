const USER_ID = "cmlsjpww90000utdwlmowv7jv";

async function main() {
  const res = await fetch("http://localhost:3000/api/tool-runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: USER_ID,
      toolSlug: "financial-literacy",
      toolName: "سنجش آگاهی مالی",
      version: 1,
      rawData: {
        totalScore: 62,
        categoryScores: {
          budget: 70,
          crisis: 55,
          inflation: 60,
          investment: 50,
          behavior: 75,
        },
        type: "متعادل",
      },
      summary: "امتیاز کل ۶۲. نقاط قوت: بودجه‌بندی و رفتار مالی. قابل رشد: سرمایه‌گذاری.",
    }),
  });

  const data = await res.json();
  console.log("STATUS:", res.status);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error("POST TOOLRUN ERROR ❌", e);
  process.exit(1);
});
