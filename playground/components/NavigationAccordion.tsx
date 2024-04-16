import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Typography, AccordionDetails, Stack } from '@mui/material';
import Link from 'next/link';

interface NavigationAccordionProps {
  title: string;
  links: {
    href: string;
    label: string;
  }[];
}

const NavigationAccordion = ({ title, links }: NavigationAccordionProps) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack>
          {links.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default NavigationAccordion;
