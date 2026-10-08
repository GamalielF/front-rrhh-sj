import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';

function Tag({ type, children, title }) {
  const { isDarkTheme } = useColorMode();

  const lightThemeStyles = {
    default: {
      backgroundColor: '#f0f0f0',
      color: '#333',
    },
    addon: {
      backgroundColor: '#e1f5fe',
      color: '#0277bd',
    },
    zip: {
      backgroundColor: '#fce4ec',
      color: '#ad1457',
    },
  };

  const darkThemeStyles = {
    default: {
      backgroundColor: '#424242',
      color: '#e0e0e0',
    },
    addon: {
      backgroundColor: '#4a6572',
      color: '#e0f7fa',
    },
    zip: {
      backgroundColor: '#6a1b9a',
      color: '#fce4ec',
    },
  };

  const selectedStyles = isDarkTheme
    ? darkThemeStyles[type] || darkThemeStyles.default
    : lightThemeStyles[type] || lightThemeStyles.default;

  const tagTitle = title || `This action supports the ${children} extension`;

  if (type === 'addon' || type === 'zip') {
    return (
      <Link to="/docs/environment/extensions-logic">
        <span
          style={{
            ...selectedStyles,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.8em',
            margin: '0 4px',
            cursor: 'pointer',
          }}
          title={tagTitle}
        >
          {children}
        </span>
      </Link>
    );
  } else {
    return (
      <span
        style={{
          ...selectedStyles,
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.8em',
          margin: '0 4px',
          cursor: 'help',
        }}
        title={tagTitle}
      >
        {children}
      </span>
    );
  }
}

export default Tag;