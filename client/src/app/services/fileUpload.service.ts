import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable()
export class FileUploadService {
  upload(url: string, method: string, file: File): Observable<any> {
    return Observable.create(observer => {
      let formData: FormData = new FormData(),
        xhr: XMLHttpRequest = new XMLHttpRequest();

      formData.append('file', file, file.name);

      xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            observer.next(JSON.stringify(xhr.response));
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      };

      xhr.open(method, url, true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('id_token'));
      xhr.send(formData);
    });
  }
}
