import { PaymentsOverview } from "@/components/Charts/advanced/payments-overview";
import { WeeksProfit } from "@/components/Charts/advanced/profit";
import { UsedDevices } from "@/components/Charts/basic/used-devices";
import { structuredAlgoliaHtmlData } from "@/libs/crawlIndex";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { ChatsCard } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { RegionLabels } from "./_components/region-labels";
import { TopChannels } from "./_components/top-channels";
import { TopChannelsSkeleton } from "./_components/top-channels/skeleton";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  await structuredAlgoliaHtmlData({
    pageUrl: process.env.SITE_URL,
    htmlString: "",
    title: "Next.js E-commerce Dashboard Page",
    type: "page",
    imageURL: "",
  });

  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <h1 className="text-6xl font-extrabold text-white drop-shadow-lg">
          ¡Bienvenido!
        </h1>
      </div>
  );
}
