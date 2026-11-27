import { LegalSection } from "@/components/LegalPage";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import type { LegalCopy } from "@/lib/i18n/en";

function renderText(text: string) {
  return text.split(/(\{site\}|\{email\})/g).map((part, index) => {
    if (part === "{site}") return <span key={index}>{SITE_NAME}</span>;
    if (part === "{email}") {
      return (
        <a
          key={index}
          className="font-medium text-[#0b5d4b] underline"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          {CONTACT_EMAIL}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function LegalBody({ copy }: { copy: LegalCopy }) {
  return (
    <>
      <p className="mt-6 text-base leading-7 text-[#3a4a45]">{renderText(copy.intro)}</p>

      {copy.sections.map((section) => (
        <LegalSection key={section.heading} title={section.heading}>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{renderText(paragraph)}</p>
          ))}
          {section.bullets && (
            <ul className="list-disc space-y-2 ps-6">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{renderText(bullet)}</li>
              ))}
            </ul>
          )}
          {section.after?.map((paragraph) => (
            <p key={paragraph}>{renderText(paragraph)}</p>
          ))}
        </LegalSection>
      ))}
    </>
  );
}
