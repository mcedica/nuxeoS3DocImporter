package org.nuxeo.sample.s3.doc.importer;

import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Context;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.annotations.Param;
import org.nuxeo.ecm.automation.core.collectors.DocumentModelCollector;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.blob.BlobManager;
import org.nuxeo.ecm.core.blob.binary.BinaryBlob;
import org.nuxeo.ecm.core.blob.binary.CachingBinaryManager;
import org.nuxeo.ecm.core.blob.binary.LazyBinary;
import org.nuxeo.runtime.api.Framework;

/**
 * Creates a document pointing to an existing blob in the configured binary manager
 */
@Operation(id = CreateDocumentFromS3Blob.ID, category = Constants.CAT_DOCUMENT, label = "Create doc from S3", description = "")
public class CreateDocumentFromS3Blob {

    public static final String ID = "CreateDocumentFromS3Blob";

    @Context
    protected CoreSession session;

    @Param(name = "filename")
    protected String filename;

    @Param(name = "mimeType")
    protected String mimeType;

    @Param(name = "digest")
    protected String digest;

    @Param(name = "length")
    protected long length;

    @OperationMethod(collector = DocumentModelCollector.class)
    public DocumentModel run(DocumentModel doc) throws Exception {

        if (filename == null) {
            filename = "Untitled";
        }
        DocumentModel newDoc = session.createDocumentModel(doc.getPathAsString(), filename, "File");
        newDoc = session.createDocument(newDoc);

        LazyBinary lazyBinary = new LazyBinary(digest, session.getRepositoryName(),
                (CachingBinaryManager) Framework.getService(BlobManager.class)
                                                .getBlobProvider(session.getRepositoryName())
                                                .getBinaryManager());

        BinaryBlob sb = new BinaryBlob(lazyBinary, digest, filename, mimeType, null, digest, length);
        newDoc.setPropertyValue("file:content", sb);
        newDoc.setPropertyValue("dc:title", filename);
        return session.saveDocument(newDoc);
    }

}
