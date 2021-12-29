import { Application, Context, Converter, ReflectionKind } from 'typedoc';

/**
 * A plugin that wraps the text of `@example` in a Markdown `typescript` code block.
 */
class WrapExampleInCodeBlockPlugin {

  /**
   * Initializes the plugin.
   * @param typedoc The TypeDoc application.
   */
  public initialize(typedoc: Readonly<Application>): void {
    typedoc.converter.on(Converter.EVENT_RESOLVE_BEGIN, (c: Readonly<Context>) => this.onConverterResolveBegin(c));
  }

  /**
   * Triggered when the TypeDoc converter begins resolving a project.
   * @param context Describes the current state the converter is in.
   */
  public onConverterResolveBegin(context: Readonly<Context>): void {
    const project = context.project;
    const reflections = [
      ...project.getReflectionsByKind(ReflectionKind.CallSignature),
      ...project.getReflectionsByKind(ReflectionKind.Class),
      ...project.getReflectionsByKind(ReflectionKind.Interface),
    ];

    for (const reflection of reflections) {
      if (reflection.comment != null && reflection.comment.hasTag('example')) {
        const tag = reflection.comment.getTag('example')!;
        tag.text = '\n```typescript\n' + tag.text.trim() + '\n```\n';
      }
    }
  }
}

/**
 * Initializes the plugin.
 * @param app Reference to the application that is loading the plugin.
 */
export function load(app: Readonly<Application>): void {
  new WrapExampleInCodeBlockPlugin().initialize(app);
}
