import cluster, { Worker as NWorker } from 'node:cluster';
// import process from 'node:process';
import { cpus } from 'node:os';

export interface IpcMessage {
  pid: number;
  type: IPCTYPE;
  // IPCTYPE.MSG 类型数据才会有
  status?: IPCSTATUS;
  wid?: string;
}

export interface Worker {
  inited: boolean;
  pid: number;
  wid: string;
  using: boolean;
}

export enum IPCTYPE {
  INIT,
  MSG,
}

export enum IPCSTATUS {
  SUCCESS,
  FAIL,
}

interface Cluster {
  MSGM(msg: IpcMessage): void;
  MSGW(msg: IpcMessage): void;
}

class Cluster {
  protected maxSize!: number;

  protected disconnectByUser = false;

  protected workers: Record<string, Worker> = {};

  constructor() {
    this.maxSize = cpus().length;
    this.onMessageM = this.onMessageM.bind(this);
  }

  get isPrimary() {
    return cluster.isPrimary;
  }

  // 切分数据
  protected splitData(data: any[]) {
    const res = new Array(this.maxSize).fill('').map(() => []);
    for (let i = 0, len = data.length; i < len; i++) {
      const resIndex = i % this.maxSize;
      res[resIndex].push(data[i]);
    }
    return res;
  }

  // 根据pid查询子进程
  protected getWkIdByPidM(pid: number) {
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker.process.pid === pid) {
        return id;
      }
    }
    return '';
  }

  // 根据索引获取子进程实例
  protected getWorkerByIndexM(index: number) {
    if (index > this.maxSize || index < 0) return null;
    const wid = Object.keys(this.workers)[index];
    return this.getWorkerByWidM(wid);
  }

  // 根据workers中的id获取进程实例
  protected getWorkerByWidM(wid: string) {
    if (!(wid in cluster.workers)) return null;
    return cluster.workers[wid];
  }

  // 获取当前可用的进程
  protected getCanUseWorkers() {
    if (!Object.keys(this.workers).length) return [];
    const tmpWids = Object.keys(this.workers).filter((wid) => {
      const worker = this.workers[wid];
      return worker.inited && !worker.using; // 初始化通信后、且未在使用中
    });
    if (!tmpWids.length) return [];
    return tmpWids.map((wid) => this.workers[wid]);
  }

  // 退出进程后, 需要做的状态处理
  protected afterExitWkM(worker: NWorker) {
    for (const wid in this.workers) {
      const wstatus = this.workers[wid];
      if (wstatus.pid === worker.process.pid) {
        delete this.workers[wid];
      }
    }
  }

  protected setWkstatus(wid: string, status: Partial<Worker> = {}) {
    this.workers[wid] = { ...this.workers[wid], ...status };
  }

  // 新建进程
  protected createWkM() {
    cluster.fork().on('message', this.onMessageM);
  }

  // 终止进程
  protected disconnectM() {
    this.disconnectByUser = true;
    process.nextTick(() => {
      cluster.disconnect();
    });
  }

  // 处理子进程消息数据
  protected onMessageM(msg: IpcMessage) {
    const { type, pid } = msg;
    if (type === IPCTYPE.INIT) {
      const wid = this.getWkIdByPidM(pid);
      if (!wid) return;
      this.workers[wid] = { inited: true, using: false, pid, wid };
    } else if (type == IPCTYPE.MSG) {
      this.MSGM && this.MSGM(msg);
    }
  }

  // 检测空闲进程
  protected idleWkM(size = this.maxSize) {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        const canusewk = this.getCanUseWorkers();
        if (Object.keys(canusewk).length >= size) {
          clearInterval(timer);
          resolve(null);
        }
      }, 0);
    });
  }

  async setupM() {
    const { maxSize } = this;
    for (let i = 0; i < maxSize; i++) {
      this.createWkM();
    }
    // 进程成功启动
    cluster.on('online', (worker) => {
      if (this.disconnectByUser) return;
      console.vlog('Worker ' + worker.process.pid + ' is online');
    });
    // 进程exit事件
    cluster.on('exit', (worker, code, signal) => {
      if (this.disconnectByUser) return;
      console.vlog(
        'Worker ' +
          worker.process.pid +
          ' died with code: ' +
          code +
          ', and signal: ' +
          signal,
      );
      this.afterExitWkM(worker); // 进程退出后
      this.createWkM();
    });

    // 确保子进程都准备好了
    return this.idleWkM();
  }

  setupW() {
    process.send({ pid: process.pid, type: IPCTYPE.INIT });
    process.on('message', (msg: IpcMessage) => {
      this.MSGW && this.MSGW(msg);
    });
  }
}

export default Cluster;
