'use babel';

import { CompositeDisposable } from 'atom';
import {existsSync, readFileSync} from 'fs';
import {join, relative, dirname, extname} from 'path';
import {exec} from 'child_process';

const EXEC_TIMEOUT = 60 * 1000; // 1 minute

console.log("Loaded");

export default {
  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
      this.subscriptions.add(textEditor.onDidSave(this.handleDidSave.bind(this)));
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  handleDidSave(event) {
    let savedFile = event.path;
    this.run({savedFile});
  },

  run({savedFile}) {
    if (extname(savedFile) !== ".java") {
      return;
    }
    
    const command = "java -jar google-java-format-1.5-all-deps.jar --replace " + savedFile;
    const options = {cwd: __dirname, timeout: EXEC_TIMEOUT};

    exec(command, options, (err, stdout, stderr) => {
      const message = 'google-java-format';

      const output = stdout.trim();
      if (output) {
        atom.notifications.addSuccess(message, {detail: output, dismissable: true});
      }

      const error = stderr.trim() || (err && err.message);
      if (error) {
        atom.notifications.addError(message, {detail: error, dismissable: true});
      }
    });
  },

  about() {
    console.log('GoogleJavaFormat!');
  }

};
