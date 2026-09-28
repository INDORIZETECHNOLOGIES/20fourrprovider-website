import type { StaticImageData } from "next/image";
import eventTeam from "./photos/event-team.webp";
import siteTeam from "./photos/site-team.webp";
import uniform from "./photos/uniform.webp";

// Photographs of Secura Force, an agency on 20fourr, used with their permission. Captions say only
// what each picture shows. Origins are recorded next to each file (photos/*.webp.json); replace the
// files with the agency's originals when they arrive, keeping the names.

export type Photo = { src: StaticImageData; alt: string; caption: string; position: string };

export const PHOTO_CREDIT = "Secura Force";

export const PHOTOS = {
  siteTeam: {
    src: siteTeam,
    alt: "A squad of uniformed security guards in navy and black marching in step across an industrial site.",
    caption: "A site security team on parade at an industrial plant.",
    position: "50% 38%",
  },
  uniform: {
    src: uniform,
    alt: "Three guards standing in a line, in black uniforms with name patches, shoulder badges, cords and red lanyards.",
    caption: "Guards in full uniform.",
    position: "72% 30%",
  },
  eventTeam: {
    src: eventTeam,
    alt: "A security team of about thirty men and women in black standing in rows outside an expo at night.",
    caption: "An event security team before a night shift at an expo.",
    position: "50% 55%",
  },
} satisfies Record<string, Photo>;
