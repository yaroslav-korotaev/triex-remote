import type {
  BlueprintSpec,
  BlockSpec,
  RemoteIndexSpec,
} from 'triex-types';
import { Blueprint } from './blueprint';
import { Block } from './block';

export type IndexFactory<S, C> = (name: string, spec: S) => C;

export type IndexOptions<S, C> = {
  remote: Remote;
  factory: IndexFactory<S, C>;
};

export class Index<S, C> {
  private index: Map<string, C>;
  private remote: Remote;
  private factory: IndexFactory<S, C>;
  
  constructor(options: IndexOptions<S, C>) {
    const {
      remote,
      factory,
    } = options;
    
    this.index = new Map();
    this.remote = remote;
    this.factory = factory;
  }
  
  public add(name: string, spec: S): Remote {
    const instance = this.factory(name, spec);
    this.index.set(name, instance);
    
    return this.remote;
  }
  
  public get(name: string): C | undefined {
    return this.index.get(name);
  }
  
  public list(): C[] {
    return Array.from(this.index.values());
  }
}

export class Remote {
  public blueprint: Index<BlueprintSpec, Blueprint>;
  public block: Index<BlockSpec, Block>;
  // TODO: remove this
  public func: { add(name: string, spec: BlockSpec): Remote };
  public stream: { add(name: string, spec: BlockSpec): Remote };
  
  constructor() {
    this.blueprint = new Index({
      remote: this,
      factory: (name, spec) => new Blueprint({ name, spec }),
    });
    this.block = new Index({
      remote: this,
      factory: (name, spec) => new Block({ name, spec }),
    });
    this.func = {
      add: (name, spec) => {
        return this.block.add(`function.${name}`, spec);
      },
    };
    this.stream = {
      add: (name, spec) => {
        return this.block.add(`stream.${name}`, spec);
      },
    };
  }
  
  public index(): RemoteIndexSpec {
    return {
      blueprints: this.blueprint.list().map(blueprint => {
        return {
          name: blueprint.name,
          resource: (blueprint.spec.resource) ? blueprint.spec.resource.schema : null,
          command: (blueprint.spec.command) ? blueprint.spec.command.schema : null,
        };
      }),
      blocks: this.block.list().map(block => {
        const spec = block.spec;
        
        return {
          name: block.name,
          queue: (spec.queue) ? {} : null,
          input: (spec.input) ? ((spec.input.type == 'one') ? { type: 'one' } : { type: 'many' }) : null,
          output: (spec.output) ? ((spec.output.type == 'one') ? { type: 'one' } : { type: 'many' }) : null,
          resource: spec.resource,
          state: (spec.state) ? {} : null,
          options: (spec.options) ? {} : null,
          params: (spec.params) ? {} : null,
          pull: !!spec.pull,
          process: !!spec.process,
        };
      }),
    };
  }
}

export function createRemote(): Remote {
  return new Remote();
}
