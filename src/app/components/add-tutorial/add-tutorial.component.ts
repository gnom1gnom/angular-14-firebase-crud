import { Component, OnInit } from '@angular/core';
import { FileUpload } from 'src/app/models/fileupload.model';
import { Tutorial } from 'src/app/models/tutorial.model';
import { TutorialService } from 'src/app/services/tutorial.service';

import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-add-tutorial',
  templateUrl: './add-tutorial.component.html',
  styleUrls: ['./add-tutorial.component.css']
})
export class AddTutorialComponent implements OnInit {

  tutorial: Tutorial = new Tutorial();
  submitted = false;
  selectedFiles?: FileList;
  currentFileUpload?: FileUpload;
  percentage = 0;

  constructor(private tutorialService: TutorialService) { }

  ngOnInit(): void {
  }

  saveTutorial(): void {
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      this.selectedFiles = undefined;

      if (file) {
        this.upload(file);
      }
    }
    else {
      this.tutorialService.create(this.tutorial).then(() => {
        console.log('Created new item successfully!');
        this.submitted = true;
      });
    }
  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(file: File): void {

    this.currentFileUpload = new FileUpload(file);
    const uploadTracker = this.tutorialService.pushFileToStorage(this.currentFileUpload);
    uploadTracker.uploadTask.percentageChanges().subscribe(percentage => {
      this.percentage = Math.round(percentage ? percentage : 0);
    });


    uploadTracker.uploadTask.snapshotChanges().pipe(
      finalize(() => {
        uploadTracker.storageRef.getDownloadURL().subscribe(downloadURL => {
          this.tutorial.fileUrl = downloadURL;
          this.tutorialService.create(this.tutorial).then(() => {
            console.log('Created new item successfully!');
            this.submitted = true;
          });
        });
      })
    ).subscribe();
  }

  newTutorial(): void {
    this.submitted = false;
    this.tutorial = new Tutorial();
    if (this.selectedFiles) delete this.selectedFiles;
    this.percentage = 0;
  }

}



