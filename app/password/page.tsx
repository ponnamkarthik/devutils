import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { PasswordTool } from "@/tools/PasswordTool";

export const metadata: Metadata = toolMetadata({
  title: "Password Generator",
  description:
    "Generate strong passwords or passphrases with configurable rules (length, symbols, exclude similar chars) plus entropy estimation.",
  path: "/password",
  keywords: [
    "password generator",
    "generate password",
    "random password generator",
    "secure password",
    "strong password",
    "password maker",
    "passphrase",
  ],
});

export default function PasswordPage() {
  return <PasswordTool />;
}
