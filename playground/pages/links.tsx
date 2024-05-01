import { USEFUL_LINKS } from '@/constants';
import { Link, Stack, Typography } from '@mui/material';

const Links = () => {
  return (
    <>
      <Typography variant="h3">Useful Links</Typography>
      <Stack spacing={2} paddingTop="30px">
        {USEFUL_LINKS.map((link) => (
          <Link key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.title}
          </Link>
        ))}
      </Stack>
    </>
  );
};

export default Links;
