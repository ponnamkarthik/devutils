"use client";

import React, { useEffect } from "react";
import { Shield, Lock, ServerOff, Cookie } from "lucide-react";
import { Card } from "../components/UI";

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="space-y-4 text-center py-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We believe your data belongs to you. DevUtils is designed to run
          entirely in your browser.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-2 border-emerald-500/20 bg-emerald-500/5">
          <ServerOff className="h-8 w-8 text-emerald-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Server Uploads</h3>
          <p className="text-sm text-muted-foreground">
            Your code, JSON, SQL, and images never leave your device. All
            processing happens locally in your browser's memory.
          </p>
        </Card>
        <Card className="p-2 border-blue-500/20 bg-blue-500/5">
          <Shield className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Tracking</h3>
          <p className="text-sm text-muted-foreground">
            We do not use Google Analytics, Facebook Pixel, or any third-party
            tracking cookies.
          </p>
        </Card>
        <Card className="p-2 border-purple-500/20 bg-purple-500/5">
          <Lock className="h-8 w-8 text-purple-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Local Storage</h3>
          <p className="text-sm text-muted-foreground">
            We only use LocalStorage to save your theme preference (Light/Dark)
            and tool state where explicitly requested.
          </p>
        </Card>
      </div>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            1. Data Handling
          </h2>
          <p>
            DevUtils is an{" "}
            <strong>offline-first, client-side application</strong>. This means:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              When you paste code into the formatted, minifiers, or converters,
              it stays in your browser's RAM.
            </li>
            <li>
              When you upload a file for hashing or base64 conversion, the file
              is read by the browser's File API and is not uploaded to any
              server.
            </li>
            <li>We do not have a backend database to store your inputs.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            2. Local Storage & Cookies
          </h2>
          <p>We use standard web technologies to provide functionality:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>LocalStorage:</strong> Used to remember your UI
              preferences (e.g., Theme, Sidebar state).
            </li>
            <li>
              <strong>IndexedDB:</strong> May be used by specific tools (like
              large CSV processing) to function efficiently without freezing the
              browser. This data is temporary and local.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            3. External Links
          </h2>
          <p>
            Some tools may link to external resources (e.g., GitHub,
            Documentation, or specific sub-tools hosted separately). Once you
            leave the <code>devutils.karthikponnam.dev</code> domain (or your
            local instance), this privacy policy no longer applies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            4. Changes to This Policy
          </h2>
          <p>
            Since we do not collect user data (emails, accounts), we cannot
            notify you of changes directly. However, significant changes to how
            the application functions will be reflected in this document and the
            project repository.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            5. Contact
          </h2>
          <p>
            If you have questions about the security or privacy of this tool,
            please review the source code on GitHub or open an issue in the
            repository.
          </p>
        </section>
      </div>
    </div>
  );
};
