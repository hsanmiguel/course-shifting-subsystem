import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { Button, Card } from "@heroui/react";
import { Link } from "react-router-dom";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Make&nbsp;</span>
          <span className={title({ color: "blue" })}>beautiful&nbsp;</span>
          <br />
          <span className={title()}>
            websites regardless of your design experience.
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            Beautiful, fast and modern React UI library.
          </div>
        </div>

        <div className="flex gap-3">
          <a
            className="button button--primary button--md rounded-full"
            href={siteConfig.links.docs}
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
          <a
            className="button button--tertiary button--md rounded-full"
            href={siteConfig.links.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubIcon size={20} />
            GitHub
          </a>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 rounded-xl bg-surface shadow-surface px-4 py-2">
            <pre className="text-sm font-medium font-mono">
              Get started by editing{" "}
              <code className="px-2 py-1 h-fit font-mono font-normal inline whitespace-nowrap rounded-sm bg-accent/20 text-accent text-sm">
                pages/index.tsx
              </code>
            </pre>
          </div>
        </div>

        {/* Course Shifting System Section */}
        <div className="mt-12 max-w-lg">
          <Card>
            <Card.Content className="gap-4 p-8">
              <h3 className="text-2xl font-bold text-gray-900">Course Shifting Subsystem</h3>
              <p className="text-gray-600">
                Manage your course shifts, track applications, and view status in real-time.
              </p>
              <Link to="/student/dashboard">
                <Button variant="primary" fullWidth>
                  Go to Student Dashboard
                </Button>
              </Link>
            </Card.Content>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
