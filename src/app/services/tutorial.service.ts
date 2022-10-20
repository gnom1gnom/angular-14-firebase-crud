import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FileUpload } from '../models/fileupload.model';
import { Tutorial } from '../models/tutorial.model';

import { nanoid } from 'nanoid'

export interface uploadTracker { uploadTask: AngularFireUploadTask, storageRef: AngularFireStorageReference }
@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private dbPath = '/tutorials';
  private basePath = '/uploads';

  tutorialsRef: AngularFireList<Tutorial>;

  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) {
    this.tutorialsRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Tutorial> {
    return this.tutorialsRef;
  }

  create(tutorial: Tutorial): any {
    return this.tutorialsRef.push(tutorial);
  }

  update(key: string, value: any): Promise<void> {
    return this.tutorialsRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.tutorialsRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.tutorialsRef.remove();
  }

  pushFileToStorage(fileUpload: FileUpload): uploadTracker {
    const filePath = `${this.basePath}/${nanoid()}${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    return {
      uploadTask: this.storage.upload(filePath, fileUpload.file),
      storageRef: storageRef
    }
  }

  deleteFile(fileUpload: FileUpload): void {
    if (fileUpload.key)
      this.deleteFileDatabase(fileUpload.key)
        .then(() => {
          this.deleteFileStorage(fileUpload.name);
        })
        .catch(error => console.log(error));
  }

  private deleteFileDatabase(key: string): Promise<void> {
    return this.tutorialsRef.remove(key);
  }

  private deleteFileStorage(name?: string): void {
    const storageRef = this.storage.ref(this.basePath);
    if (name)
      storageRef.child(name).delete();
  }

}
