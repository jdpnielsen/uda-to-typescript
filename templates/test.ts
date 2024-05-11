import { EmptyObjectType } from './base-types';
import { APage } from './test-types';
import { ExpandNestedProperty } from './utils-v2';

// TODO $all -> prop -- YOU ARE HERE
type AllAllProp = ExpandNestedProperty<APage, {
	$all: 'bPage_single'
}>;

const allAllProp: AllAllProp = {} as AllAllProp;

allAllProp.properties.aPage_single?.properties.bPage_single?.contentType satisfies 'cPage' | undefined;
allAllProp.properties.aPage_single?.properties.bPage_single?.properties.propValue satisfies 'CPage' | undefined;
allAllProp.properties.aPage_single?.properties.bPage_multi?.[0].contentType satisfies 'cPage' | undefined;
allAllProp.properties.aPage_single?.properties.bPage_multi?.[0].properties satisfies EmptyObjectType | undefined

allAllProp.properties.aPage_multi?.[0].properties.bPage_multi?.[0].properties satisfies EmptyObjectType | undefined
allAllProp.properties.aPage_multi?.[0].properties.bPage_single?.properties.cPage_single?.properties satisfies EmptyObjectType | undefined
allAllProp.properties.aPage_multi?.[0].properties.bPage_single?.properties.cPage_multi?.[0]?.properties satisfies EmptyObjectType | undefined

/* type AllProp = ExpandNestedProperty<ContentPage, {
	$all: 'ref'
}>;

const allProp: AllProp = {} as AllProp;

allProp.properties.meta_description satisfies string | undefined
allProp.properties.ref?.properties.meta_description satisfies string | undefined
allProp.properties.ref?.properties.ref?.properties.meta_description satisfies string | undefined
allProp.properties.ref?.properties.ref?.properties.ref?.properties satisfies EmptyObjectType | undefined
allProp.properties.ref?.properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
allProp.properties.test?.[0].properties.test?.[0].properties satisfies EmptyObjectType | undefined
 */
/*
// $all.$all -> $all
type AllAllAll = ExpandNestedProperty<ContentPage, {
	$all: {
		'$all': '$all'
	}
}>;

const allAllAll: AllAllAll = {} as AllAllAll;

allAllAll.properties.test?.[0].properties

allAllAll.properties.ref?.properties.meta_title satisfies string | undefined
allAllAll.properties.ref?.properties.ref?.properties.meta_title satisfies string | undefined
allAllAll.properties.ref?.properties.ref?.properties.ref?.properties.ref?.properties satisfies EmptyObjectType | undefined
allAllAll.properties.ref?.properties.test?.[0].properties.ref?.properties?.ref?.properties satisfies EmptyObjectType | undefined
allAllAll.properties.ref?.properties.test?.[0].properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
 */

/*
// prop -> [Prop]
type PropProp = ExpandNestedProperty<ContentPage, {
	ref: 'test'
}>;

const propProp: PropProp = {} as PropProp;

propProp.properties.ref
propProp.properties.ref?.properties.ref?.properties.meta_title satisfies string | undefined
propProp.properties.ref?.properties.ref?.properties.ref?.properties satisfies EmptyObjectType | undefined
propProp.properties.ref?.properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
propProp.properties.ref?.properties.test?.[0].properties.test?.[0].properties satisfies EmptyObjectType | undefined
propProp.properties.test?.[0]?.properties satisfies EmptyObjectType | undefined
// test.properties.ref = undefined
// test.properties.[0].properties.ref[0].properties.ref[0].properties.meta_title;

propProp.properties.meta_description satisfies string | undefined
propProp.properties.ref?.properties.meta_description satisfies string | undefined
propProp.properties.ref?.properties.ref?.properties.meta_description satisfies string | undefined
propProp.properties.ref?.properties.ref?.properties.ref?.properties satisfies EmptyObjectType | undefined
propProp.properties.ref?.properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
propProp.properties.test?.[0].properties satisfies EmptyObjectType | undefined

// prop -> All
type PropAll = ExpandNestedProperty<ContentPage, {
	'ref': '$all'
}>;

const propAll: PropAll = {} as PropAll;
propAll.properties.test?.[0].properties
propAll.properties.test?.[0]?.properties satisfies EmptyObjectType | undefined
// test.properties.ref = undefined
// test.properties.[0].properties.ref[0].properties.ref[0].properties.meta_title;

if (propAll.properties.test?.[0].properties.test?.[0] && propAll.properties.ref?.properties.ref?.properties.ref?.properties) {

	propAll.properties.meta_description satisfies string | undefined
	propAll.properties.ref.properties.meta_description satisfies string | undefined
	propAll.properties.ref.properties.ref.properties.meta_description satisfies string | undefined
	propAll.properties.ref.properties.ref.properties.ref.properties satisfies EmptyObjectType
	propAll.properties.ref.properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
	propAll.properties.test[0].properties satisfies EmptyObjectType
}

// all -> Prop
type AllProp = ExpandNestedProperty<ContentPage, {
	$all: 'ref'
}>;

const allProp: AllProp = {} as AllProp;

// test.properties.ref = undefined
// test.properties.[0].properties.ref[0].properties.ref[0].properties.meta_title;

if (allProp.properties.test?.[0].properties.test?.[0] && allProp.properties.ref?.properties.ref?.properties.ref?.properties) {

	allProp.properties.meta_description satisfies string | undefined
	allProp.properties.ref.properties.meta_description satisfies string | undefined
	allProp.properties.ref.properties.ref.properties.meta_description satisfies string | undefined
	allProp.properties.ref.properties.ref.properties.ref.properties satisfies EmptyObjectType
	allProp.properties.test[0].properties.test?.[0].properties satisfies EmptyObjectType
}

// all -> all
type AllAll = ExpandNestedProperty<ContentPage, {
	$all: '$all'
}>;

const allAll: AllAll = {} as AllAll;

// test.properties.ref = undefined
// test.properties.[0].properties.ref[0].properties.ref[0].properties.meta_title;

if (allAll.properties.ref?.properties.ref?.properties.ref?.properties.meta_title) {
	allAll.properties.meta_description satisfies string | undefined
	allAll.properties.ref.properties.meta_description satisfies string | undefined
	allAll.properties.ref.properties.ref.properties.meta_description satisfies string | undefined
	allAll.properties.ref.properties.ref.properties.ref.properties satisfies EmptyObjectType
}
 */
