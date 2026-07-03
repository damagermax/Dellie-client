import EntityAuditTimeline from "@/components/audit/EntityAuditTimeline";
import { Contact } from "@/types/contact";

interface ContactSummaryProps {
  contact: Contact;
}

export default function ContactSummary({ contact }: ContactSummaryProps) {
  return (
    <aside id="contact-summary" className="w-full scroll-mt-14 border-t border-gray-200 bg-gray-50 px-5 pb-8 pt-6 lg:w-[30%] lg:border-l lg:border-t-0 lg:px-7">
      <div className="pt-6">
        <EntityAuditTimeline entityType="contact" entityId={contact.id} />
      </div>
    </aside>
  );
}
