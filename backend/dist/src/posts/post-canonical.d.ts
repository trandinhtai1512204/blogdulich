type CatNode = {
    id: string;
    slug: string;
    type?: string | null;
    level?: string | null;
    parentId: string | null;
    cityId?: string | null;
    parent?: CatNode | null;
};
type PostInput = {
    slug: string;
    category?: CatNode | null;
};
export declare function computePostCanonicalPath(post: PostInput): string;
export declare const CATEGORY_WITH_ANCESTORS_SELECT: {
    readonly id: true;
    readonly name: true;
    readonly slug: true;
    readonly type: true;
    readonly level: true;
    readonly parentId: true;
    readonly cityId: true;
    readonly parent: {
        readonly select: {
            readonly id: true;
            readonly name: true;
            readonly slug: true;
            readonly type: true;
            readonly level: true;
            readonly parentId: true;
            readonly cityId: true;
            readonly parent: {
                readonly select: {
                    readonly id: true;
                    readonly name: true;
                    readonly slug: true;
                    readonly type: true;
                    readonly level: true;
                    readonly parentId: true;
                    readonly cityId: true;
                    readonly parent: {
                        readonly select: {
                            readonly id: true;
                            readonly name: true;
                            readonly slug: true;
                            readonly type: true;
                            readonly level: true;
                            readonly parentId: true;
                            readonly cityId: true;
                        };
                    };
                };
            };
        };
    };
};
export {};
