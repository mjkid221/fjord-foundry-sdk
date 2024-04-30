import { Box, Stack, IconButton, Tooltip } from '@mui/material';
import CottageIcon from '@mui/icons-material/Cottage';
import NextLinkComposed from './NextLinkComposed';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';

const Navigation = () => {
  return (
    <Box sx={{ maxWidth: 500 }}>
      <Stack direction="row" spacing={4}>
        <Tooltip title="Home" arrow>
          <IconButton aria-label="home" component={NextLinkComposed} href="/" size="large">
            <CottageIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Read" arrow>
          <IconButton aria-label="read" component={NextLinkComposed} href="/read/solana" size="large">
            <MenuBookIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Write" arrow>
          <IconButton aria-label="write" component={NextLinkComposed} href="/write/solana" size="large">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Useful Links" arrow>
          <IconButton aria-label="links" component={NextLinkComposed} href="/links" size="large">
            <LinkIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default Navigation;
