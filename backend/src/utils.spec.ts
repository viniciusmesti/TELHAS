import * as fs from 'fs';
import { removeAcentos, normalizeText, formatDate, exportToTxt } from './utils';

describe('utils helpers', () => {
  describe('removeAcentos', () => {
    it('should remove accent characters from string', () => {
      const input = 'Olá, çéãõ';
      expect(removeAcentos(input)).toBe('Ola, ceao');
    });

    it('should return empty string when input is falsy', () => {
      // @ts-expect-error testing undefined
      expect(removeAcentos(undefined)).toBe('');
    });
  });

  describe('normalizeText', () => {
    it('should trim, remove accents, collapse spaces and uppercase', () => {
      const input = '  Olá    Mundo ç  ';
      const result = normalizeText(input);
      expect(result).toBe('OLA MUNDO C');
    });

    it('should return empty string for non-string', () => {
      // @ts-expect-error testing number
      expect(normalizeText(123 as any)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date to dd/mm/yy', () => {
      expect(formatDate('2024-10-17')).toBe('17/10/24');
    });

    it('should return input if not a valid ISO date', () => {
      expect(formatDate('2024-10')).toBe('2024-10');
    });
  });

  describe('exportToTxt', () => {
    it('should write txt file with CRLF line endings', () => {
      const spy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      const data = ['a', 'b'];
      exportToTxt(data, 'out.txt');
      expect(spy).toHaveBeenCalledWith('out.txt', 'a\r\nb\r\n', { encoding: 'utf8' });
      spy.mockRestore();
    });
  });
});
