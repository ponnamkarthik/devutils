import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { FakeDataTool } from "@/tools/FakeDataTool";

export const metadata: Metadata = toolMetadata({
  title: "Fake Data Generator",
  description:
    "Generate realistic fake data for testing: names, emails, addresses, UUIDs, and more.",
  path: "/fake-data",
  keywords: [
    "fake data",
    "fake data generator",
    "test data",
    "test data generator",
    "mock data",
    "dummy data",
    "random data",
    "sample data",
  ],
});

export default function FakeDataPage() {
  return <FakeDataTool />;
}
