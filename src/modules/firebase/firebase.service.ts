import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
import {
  CollectionReference,
  DocumentData,
  Firestore,
} from "firebase-admin/firestore";
import { Auth } from "firebase-admin/auth";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FirebaseService {
  private static app: admin.app.App;
  private firestore: Firestore;
  auth: Auth;

  constructor(readonly configService: ConfigService) {
    if (FirebaseService.app == null) {
      FirebaseService.app = admin.initializeApp({
        credential: admin.credential.cert(this.serviceAccount),
      });
    }
    this.firestore = FirebaseService.app.firestore();
    this.auth = FirebaseService.app.auth();
  }

  public collection(collectionPath: string): CollectionReference<DocumentData> {
    return this.firestore.collection(collectionPath);
  }

  private get serviceAccount(): {} {
    return {
      type: this.configService.get("TYPE"),
      project_id: this.configService.get("PROJECT_ID"),
      private_key_id: this.configService.get("PRIVATE_KEY_ID"),
      private_key: this.configService.get("PRIVATE_KEY").replace(/\\n/g, "\n"),
      client_email: this.configService.get("CLIENT_EMAIL"),
      client_id: this.configService.get("CLIENT_ID"),
      auth_uri: this.configService.get("AUTH_URI"),
      token_uri: this.configService.get("TOKEN_URI"),
      auth_provider_x509_cert_url: this.configService.get("AUTH_PROVIDER_X509_CERT_URL"),
      client_x509_cert_url: this.configService.get("CLIENT_X509_CERT_URL"),
      universe_domain: this.configService.get("UNIVERSE_DOMAIN"),
    };
  }
}
