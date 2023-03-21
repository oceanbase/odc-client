import { InputStream, Token } from 'antlr4';

const ANTLRInputStream = InputStream;

export default class CaseInsensitiveStream extends ANTLRInputStream {
  LA(offset) {
    const result = super.LA(offset);

    switch (result) {
      case 0:
      case Token.EOF:
        return result;
      default:
        return String.fromCharCode(result).toUpperCase().charCodeAt(0);
    }
  }
}
