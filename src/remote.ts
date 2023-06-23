import type {
  BlueprintSpec,
  FuncSpec,
  StreamSpec,
  RemoteIndexSpec,
} from 'triex-types';
import { Blueprint } from './blueprint';
import { Func } from './func';
import { Stream } from './stream';

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
  public func: Index<FuncSpec, Func>;
  public stream: Index<StreamSpec, Stream>;
  
  constructor() {
    this.blueprint = new Index({
      remote: this,
      factory: (name, spec) => new Blueprint({ name, spec }),
    });
    this.func = new Index({
      remote: this,
      factory: (name, spec) => new Func({ name, spec }),
    });
    this.stream = new Index({
      remote: this,
      factory: (name, spec) => new Stream({ name, spec }),
    });
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
      functions: this.func.list().map(func => {
        return {
          name: func.name,
          args: (func.spec.args)
            ? (func.spec.args.is) ? { is: func.spec.args.is.schema } : { is: null }
            : null
          ,
          result: (func.spec.result)
            ? (func.spec.result.is) ? { is: func.spec.result.is.schema } : { is: null }
            : null
          ,
        };
      }),
      streams: this.stream.list().map(stream => {
        return {
          name: stream.name,
          resource: stream.spec.resource,
          state: (stream.spec.state)
            ? (stream.spec.state.is) ? { is: stream.spec.state.is.schema } : { is: null }
            : null
          ,
          params: (stream.spec.params)
            ? (stream.spec.params.is) ? { is: stream.spec.params.is.schema } : { is: null }
            : null
          ,
        };
      }),
    };
  }
}

export function createRemote(): Remote {
  return new Remote();
}
