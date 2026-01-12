import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { PasswordTool } from "@/tools/PasswordTool";

export const metadata: Metadata = toolMetadata({
  title: "Password Generator",
  description:
    "Generate strong passwords and passphrases with customizable length and character sets.",
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
