import type {
  StreamSpec,
  RemoteStreamParamsSchemaRequest,
  RemoteStreamParamsSchemaResponse,
  RemoteStreamEnumerateRequest,
  RemoteStreamEnumerateResponse,
  RemoteStreamProcessRequest,
  RemoteStreamProcessResponse,
  RemoteStream,
} from 'triex-types';

export type StreamOptions = {
  name: string;
  spec: StreamSpec;
};

export class Stream implements RemoteStream {
  public name: string;
  public spec: StreamSpec;
  
  constructor(options: StreamOptions) {
    const {
      name,
      spec,
    } = options;
    
    this.name = name;
    this.spec = spec;
  }
  
  public async paramsSchema(
    request: RemoteStreamParamsSchemaRequest,
  ): Promise<RemoteStreamParamsSchemaResponse> {
    const params = this.spec.params;
    
    if (params) {
      const schema = params.is?.schema ?? null;
      
      return { schema };
    } else {
      return { schema: null };
    }
  }
  
  public async enumerate(
    request: RemoteStreamEnumerateRequest,
  ): Promise<RemoteStreamEnumerateResponse> {
    const callback = this.spec.enumerate;
    
    if (callback) {
      const variants = await callback(request.resource);
      
      return { variants };
    } else {
      return { variants: [] };
    }
  }
  
  public async process(request: RemoteStreamProcessRequest): Promise<RemoteStreamProcessResponse> {
    const result = await this.spec.process({
      now: new Date(request.now),
      resource: request.resource,
      state: request.state,
      params: request.params,
    });
    
    return result;
  }
}
