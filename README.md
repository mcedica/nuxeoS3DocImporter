# nuxeoS3DocImporter
Sample code to create an existing document in Nuxeo from an existing blob in S3.


Sample invocation:

mariana$ md5 /Users/mariana/Downloads/FooFigthers.pdf
MD5 (/Users/mariana/Downloads/FooFigthers.pdf) = 1a29c592b09ee7725415efa354907426

mariana$ aws s3api put-object --bucket mariana --key 1a29c592b09ee7725415efa354907426 --body /Users/mariana/Downloads/FooFigthers.pdf --content-type application/pdf --metadata title=FooFighters.pdf

{
    "ETag": "\"1a29c592b09ee7725415efa354907426\""
}

This creates the following document in Nuxeo:

<document repository="default" id="aa99c46d-8110-47db-94f1-cd7c7c28c539">
<system>
<type>File</type>
<path>
default-domain/UserWorkspaces/Administrator/FooFighters.pdf
</path>
...
<schema xmlns:file="http://www.nuxeo.org/ecm/schemas/file/" name="file">
<file:content>
<encoding/>
<mime-type>application/pdf</mime-type>
<filename>FooFighters.pdf</filename>
<data>9d77cb1.blob</data>
<digest>1a29c592b09ee7725415efa354907426</digest>
</file:content>
<file:filename/>
</schema>

</document>
