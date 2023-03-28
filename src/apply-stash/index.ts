import { execSync } from 'node:child_process';
import Cluster, { IPCTYPE, type IpcMessage } from '../core/cluster.js';
import type { Options } from '../interfaces/apply-stash.js';

interface MessageW extends IpcMessage {
  stashIds: string[];
}

interface MessageM extends IpcMessage {
  errorIds: string[];
  successIds: string[];
}

export default class Main extends Cluster {
  private searchStashId: string[] = [];

  private MINSIZE = 500;

  private startTime;

  constructor(private options: Options) {
    super();
    this.startTime = Date.now();
  }

  private getStashIds() {
    const stdout = execSync('git fsck --lost-found', { encoding: 'utf8' });
    const ids = stdout?.split(/[\s\r\n]+/)?.filter((id) => /[0-9]+/.test(id));
    return ids ?? [];
  }

  private search(stashId: string) {
    return new Promise<string>((resolve) => {
      const { searchText } = this.options;
      const stdout = execSync(`git show ${stashId}`, { encoding: 'utf8' });
      if (!stdout) return resolve('');
      stdout.includes(searchText) ? resolve(stashId) : resolve('');
    });
  }

  private async searchInMinsize(stashIds: string[]) {
    const res = [];
    for (let i = 0, len = stashIds.length; i < len; i++) {
      try {
        const isEmpty = await this.search(stashIds[i]);
        if (isEmpty !== '') {
          res.push(stashIds[i]);
        }
      } catch (err) {
        continue;
      }
    }
    console.log('time searchInMinsize', Date.now() - this.startTime);
    console.log('stashIds =>', res);
  }

  async setup() {
    if (this.isPrimary) {
      const stashIds = this.getStashIds();
      if (stashIds.length < this.MINSIZE) {
        return this.searchInMinsize(stashIds);
      }
      await this.setupM(); // 初始化子进程
      try {
        const iWorkers = this.getCanUseWorkers();
        const dataList = this.splitData(stashIds);
        for (let i = 0, len = dataList.length; i < len; i++) {
          const stashIds = dataList[i];
          const { wid, pid } = iWorkers[i];
          const worker = this.getWorkerByWidM(wid);
          this.setWkstatusM(wid, { using: true });
          worker.send({ wid, pid, type: IPCTYPE.MSG, stashIds });
        }
        // 主进程检测任务完成
        await this.idleWkM();
        console.log('time setup', Date.now() - this.startTime);
        console.log('stashIds =>', this.searchStashId);
        this.disconnectM();
      } catch (err) {
        console.log('setup err', err);
      }
    } else {
      this.setupW(); // 子进程
    }
  }

  // 主进程消息处理
  MSGM(msg: MessageM) {
    const { errorIds, successIds, wid } = msg;
    if (errorIds.length) {
      // 子进程处理中错误的errorId
      // TODO
    }
    // 寻找到了stashId
    if (successIds.length) {
      this.searchStashId = [...this.searchStashId, ...successIds];
    }
    this.setWkstatusM(wid, { using: false });
  }

  // 子进程消息处理
  async MSGW({ stashIds, ...otherMsg }: MessageW) {
    const successIds = [];
    const errorIds = [];
    for (let i = 0, len = stashIds.length; i < len; i++) {
      const stashId = stashIds[i];
      try {
        const res = await this.search(stashId);
        if (res !== '') {
          successIds.push(stashId);
        }
      } catch (err) {
        errorIds.push(stashId);
        continue;
      }
    }
    process.send({ ...otherMsg, successIds, errorIds });
  }
}
