"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Gavel, FileText } from "lucide-react";
import { Card } from "../components/UI";

export const TermsOfService: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="space-y-4 text-center py-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Please read these terms carefully before using DevUtils.
        </p>
      </div>

      <Card className="p-2 border-yellow-500/20 bg-yellow-500/5 mb-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500 shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-yellow-700 dark:text-yellow-400">
              Disclaimer of Warranties
            </h3>
            <p className="text-sm text-yellow-800/80 dark:text-yellow-200/80 leading-relaxed">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
              NONINFRINGEMENT.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using DevUtils, you accept and agree to be bound by
            the terms and provision of this agreement. If you do not agree to
            abide by these terms, please do not use this service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">2. Use License</h2>
          <p>
            DevUtils is an open-source tool. You are free to use it for
            personal, educational, or commercial purposes. However:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              You may not use this service for any illegal or unauthorized
              purpose.
            </li>
            <li>
              You agree not to reproduce, duplicate, copy, sell, resell or
              exploit any portion of the Service without express written
              permission or in accordance with the open-source license (MIT)
              where applicable.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            3. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, the developer(s)
            and contributor(s) of DevUtils shall not be liable for any indirect,
            incidental, special, consequential or punitive damages, or any loss
            of profits or revenues, whether incurred directly or indirectly, or
            any loss of data, use, goodwill, or other intangible losses,
            resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              Your access to or use of or inability to access or use the
              service.
            </li>
            <li>Any errors, mistakes, or inaccuracies of content or tools.</li>
            <li>
              Any bugs, viruses, trojan horses, or the like that may be
              transmitted to or through our service by any third party.
            </li>
            <li>
              Any loss of your code, data, or files processed through the web
              interface.
            </li>
          </ul>
          <p className="font-medium mt-4">
            DevUtils is a developer tool. You are responsible for verifying the
            output of any code formatter, minifier, or converter before using it
            in a production environment.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            4. Changes to Terms
          </h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. By continuing to access or use our Service
            after those revisions become effective, you agree to be bound by the
            revised terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            5. Governing Law
          </h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws, without regard to its conflict of law provisions.
          </p>
        </section>
      </div>
    </div>
  );
};
