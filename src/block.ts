import type {
  BlockSpec,
  RemoteBlockPullRequest,
  RemoteBlockPullResponse,
  RemoteBlockProcessRequest,
  RemoteBlockProcessResponse,
  RemoteBlock,
} from 'triex-types';
import {
  createPullContext,
  createProcessContext,
} from 'triex-factory';

export type BlockOptions = {
  name: string;
  spec: BlockSpec;
};

export class Block implements RemoteBlock {
  public name: string;
  public spec: BlockSpec;
  
  constructor(options: BlockOptions) {
    const {
      name,
      spec,
    } = options;
    
    this.name = name;
    this.spec = spec;
  }
  
  public async pull(
    request: RemoteBlockPullRequest,
  ): Promise<RemoteBlockPullResponse> {
    if (!this.spec.pull) {
      throw new Error('not implemented');
    }
    
    const abortController = new AbortController();
    const ctx = createPullContext(abortController.signal, request.data);
    
    await this.spec.pull(ctx);
    
    const result = ctx.result();
    
    return {
      result: {
        next: (result.next) ? result.next.toISOString() : undefined,
        state: result.state,
        objects: result.objects,
      },
    };
  }
  
  public async process(
    request: RemoteBlockProcessRequest,
  ): Promise<RemoteBlockProcessResponse> {
    if (!this.spec.process) {
      throw new Error('not implemented');
    }
    
    const abortController = new AbortController();
    const ctx = createProcessContext(abortController.signal, request.data);
    
    await this.spec.process(ctx);
    
    return { result: ctx.result() };
  }
}
