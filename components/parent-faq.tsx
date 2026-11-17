"use client";
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '@/components/ui/accordion';
export function ParentFAQ(){return <section className="parent-faq page-shell"><p className="section-kicker">FOR PARENTS</p><h2>FAQs</h2><Accordion type="single" collapsible>{[
 ['Who can take part?','LVL Up is for children aged 8–15. The four categories are 8–9, 10–11, 12–13 and 14–15, with station formats adapted by age.'],
 ['How do I book for my child?','Sign in to a parent account, choose an event and session, and enter your child’s details. Your confirmed entry pass is saved in My account. You can add more than one child.'],
 ['What should we bring?','Training shoes with good grip and a labelled water bottle. Check your entry pass for the organiser’s reporting instructions.'],
 ].map(([q,a],i)=><AccordionItem key={q} value={String(i)}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}</Accordion></section>;}
