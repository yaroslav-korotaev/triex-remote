import type {
  FuncSpec,
  RemoteFuncExecRequest,
  RemoteFuncExecResponse,
  RemoteFunc,
} from 'triex-types';

export type FuncOptions = {
  name: string;
  spec: FuncSpec;
};

export class Func implements RemoteFunc {
  public name: string;
  public spec: FuncSpec;
  
  constructor(options: FuncOptions) {
    const {
      name,
      spec,
    } = options;
    
    this.name = name;
    this.spec = spec;
  }
  
  public async exec(request: RemoteFuncExecRequest): Promise<RemoteFuncExecResponse> {
    const result = await this.spec.exec(request.args);
    
    return { result };
  }
}
