import type React from 'react';
import defaultAvatar from '../assets/default-avatar.svg';

// Profile pictures may live on Cloudinary (internet) and can be slow or unreachable,
// e.g. in a local-network demo. Spread these props on every avatar <img>:
//  - while the picture loads, the default avatar shows underneath (no black circle)
//  - if it fails, the default avatar replaces it
//  - once it loads, the placeholder is removed (so transparent pictures look right)
const showFallbackAvatar = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.getAttribute('src') === defaultAvatar) return; // the fallback itself failed: don't loop
  img.src = defaultAvatar;
};

const hidePlaceholder = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.backgroundImage = 'none';
};

export const avatarProps = {
  onError: showFallbackAvatar,
  onLoad: hidePlaceholder,
  style: {
    backgroundImage: `url("${defaultAvatar}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } as React.CSSProperties,
};
