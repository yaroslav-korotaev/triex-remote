import type {
  FuncSpec,
  StreamSpec,
  RemoteFunc,
  RemoteStream,
  RemoteIndexSpec,
} from 'triex-types';
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
  public func: Index<FuncSpec, RemoteFunc>;
  public stream: Index<StreamSpec, RemoteStream>;
  
  constructor() {
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
      functions: this.func.list().map(func => func.name),
      streams: this.stream.list().map(stream => stream.name),
    };
  }
}

export function createRemote(): Remote {
  return new Remote();
}
