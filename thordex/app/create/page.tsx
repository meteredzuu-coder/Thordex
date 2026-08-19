import type { Metadata } from "next";
import { CreateCoinForm } from "@/components/CreateCoinForm";

export const metadata: Metadata = {
  title: "Create Your Token — Thordex",
  description: "Create and launch your token in Kryvora Network.",
};

export default function CreateCoinPage() {
  return <CreateCoinForm />;
}
