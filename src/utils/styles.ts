import { customAlphabet } from 'nanoid';

const generateId = customAlphabet('1234567890abcdef', 10);

export const createStyleSheet = (styleFactory: (className: string) => string, prefix = 'solid-utilities') => {
  const stylesheet = new CSSStyleSheet();
  const className = `${prefix}-${generateId()}`;
  
  stylesheet.replaceSync(styleFactory(className));

  const useStyleSheet = () => {
    const isExist = document.adoptedStyleSheets.some((it) => it === stylesheet);
    if (!isExist) document.adoptedStyleSheets = [stylesheet];

    return className;
  };

  return useStyleSheet;
};
