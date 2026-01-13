import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { FakeDataTool } from "@/tools/FakeDataTool";

export const metadata: Metadata = toolMetadata({
  title: "Fake Data Generator",
  description:
    "Generate realistic fake data sets for testing and demos, with export options (JSON/CSV) and configurable fields.",
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
