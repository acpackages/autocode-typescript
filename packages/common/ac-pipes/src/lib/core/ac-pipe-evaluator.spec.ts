import { evaluateAcPipeExpression, parsePipeChain } from './ac-pipe-evaluator';
import { acPipeRegistry } from './ac-pipe';

describe('ac-pipe-evaluator', () => {
  beforeAll(() => {
    acPipeRegistry.register({
      name: 'greet',
      transform: (value: any, greeting: string, options?: any) => {
        const prefix = greeting || 'Hello';
        const suffix = options?.suffix || '';
        return `${prefix} ${value}${suffix}`;
      }
    });
  });

  describe('evaluateAcPipeExpression', () => {
    const context = {
      user: { name: 'Alice' },
      myGreeting: 'Hi',
      myOptions: { suffix: '!' },
      mySuffix: '!!!'
    };

    const evaluateFunction = ({ expression, context }: { expression: string; context: any }) => {
      return new Function(...Object.keys(context), `return (${expression});`)(
        ...Object.values(context)
      );
    };

    it('should evaluate pipe with literal arguments', async () => {
      const result = await evaluateAcPipeExpression({
        expression: "user.name | greet:'Hello',{suffix: '?'}",
        context,
        evaluateFunction
      });
      expect(result).toBe('Hello Alice?');
    });

    it('should evaluate pipe with variable reference argument', async () => {
      const result = await evaluateAcPipeExpression({
        expression: "user.name | greet:myGreeting",
        context,
        evaluateFunction
      });
      expect(result).toBe('Hi Alice');
    });

    it('should evaluate pipe with variable reference nested inside object literal', async () => {
      const result = await evaluateAcPipeExpression({
        expression: "user.name | greet:myGreeting,{suffix: mySuffix}",
        context,
        evaluateFunction
      });
      expect(result).toBe('Hi Alice!!!');
    });

    it('should evaluate pipe with whole object variable reference', async () => {
      const result = await evaluateAcPipeExpression({
        expression: "user.name | greet:myGreeting,myOptions",
        context,
        evaluateFunction
      });
      expect(result).toBe('Hi Alice!');
    });
  });

  describe('parsePipeChain', () => {
    it('should split pipes normally', () => {
      const result = parsePipeChain('data | uppercase');
      expect(result.base).toBe('data');
      expect(result.pipes.length).toBe(1);
      expect(result.pipes[0].name).toBe('uppercase');
    });

    it('should NOT split on || (logical OR)', () => {
      const result = parsePipeChain('true || false');
      expect(result.base).toBe('true || false');
      expect(result.pipes.length).toBe(0);
    });

    it('should handle logical OR along with a valid pipe', () => {
      const result = parsePipeChain('data || fallback | uppercase');
      expect(result.base).toBe('data || fallback');
      expect(result.pipes.length).toBe(1);
      expect(result.pipes[0].name).toBe('uppercase');
    });

    it('should handle pipes with string arguments containing ||', () => {
      const result = parsePipeChain('data | default:"a||b"');
      expect(result.base).toBe('data');
      expect(result.pipes.length).toBe(1);
      expect(result.pipes[0].name).toBe('default');
      expect(result.pipes[0].args[0]).toBe('a||b');
    });

    it('should handle multiple logical OR operators', () => {
        const result = parsePipeChain('a || b || c | uppercase');
        expect(result.base).toBe('a || b || c');
        expect(result.pipes.length).toBe(1);
        expect(result.pipes[0].name).toBe('uppercase');
    });
  });
});
